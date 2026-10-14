---
title: "CS Fundamentals: OOPS - Object Oriented Programming"
description: "OOPS from an engineer's lens, in C++: classes, constructors and the Rule of 5, the four pillars, virtual functions and vtables, smart pointers, class relationships, UML, and SOLID, plus interview Q&A and projects to build next."
pubDatetime: 2026-10-10T22:11:07.000+05:30 
author: Aayushmaan Soni
slug: /cs-fundamentals/oops
tags: ["oops", "cpp"]
draft: false
featured: true
series:  CS Fundamentals
seriesOrder:  2
---

## Table of Contents

## Introduction
This is **Part 2** of my **CS Fundamentals** series, where I'm putting down the core CS subjects as short, to-the-point notes. They're the same notes I use myself for learning and revision, cleaned up so anyone can use them.

Each part covers the basics, but always from a **software engineer's lens**: what actually shows up when you write, review, and design real code, not just what's asked in exams.

**In this part** we cover OOPS in **C++**. C++ has every OOP feature interviewers ask about (real access modifiers, overloading, virtual functions, destructors, multiple inheritance), so it's the best language to learn the concepts in. Where Python or TypeScript behave differently, there's a short note.

We start with the C++ basics you need, go through classes, constructors, and the four pillars (encapsulation, abstraction, inheritance, polymorphism), then memory ownership, class relationships, UML, and SOLID. That last part is the bridge to **LLD**. At the end there's a quick interview Q&A and a list of projects to build.

Code examples skip `#include`s and assume `using namespace std;`.

Read it top to bottom the first time; after that, use it as a quick reference.

## 1. C++ Prerequisites
- **Stack**: stores local variables and objects; freed automatically when the scope ends; fast; limited size
- **Heap (free store)**: memory you ask for at runtime with `new`; lives until you `delete` it; you manage its lifetime
- **`new` / `delete`**: allocate / free one object on the heap; arrays use `new[]` / `delete[]` (mixing them is undefined behaviour)
- **Memory leak**: heap memory that's never freed
- **Dangling pointer**: a pointer to memory that's already been freed; using it is undefined behaviour

```cpp
int a = 10;              // stack: freed automatically when the scope ends
int* b = new int(20);    // heap: stays until you delete it
int* arr = new int[5];   // heap array

delete b;                // you must free heap memory yourself
delete[] arr;            // arrays need delete[]
```

- **Pointer**: a variable that stores an address; can be `nullptr`; can be pointed somewhere else later
- **Reference**: an alias for an existing object; must be initialized; can't be null; can't be rebound to another object

```cpp
int x = 10;
int* ptr = &x;   // pointer to x
int& ref = x;    // another name for x

*ptr = 20;       // x is now 20
ref = 30;        // x is now 30
```

- **Pass by value / reference / const reference**:
  - `void f(string s)`: copies the argument
  - `void f(string& s)`: no copy; `f` can modify the caller's object
  - `void f(const string& s)`: no copy, read-only; the default way to pass objects you don't need to modify
- **`struct` vs `class`**: identical in C++ except for defaults
  - `struct`: members and inheritance are **public** by default
  - `class`: members and inheritance are **private** by default
  - Convention: `struct` for plain data, `class` for types with invariants and behaviour

```cpp
struct Point {
    int x, y;            // public by default
};

class BankAccount {
    double balance = 0;  // private by default
public:
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
};
```

## 2. Programming Paradigms
- **Programming paradigm**: a style of organizing code, state, and control flow; it's a property of the design, not the language (the Linux kernel writes OO-style C; you can write procedural C++)
- **Imperative vs declarative**: imperative says **how** (step-by-step state changes); declarative says **what** (the result you want); procedural and OOP are imperative; functional and SQL are declarative
- **Procedural**: code is a sequence of functions operating on shared data; used for low-level, performance-critical code (kernels, drivers, embedded) where you want explicit control
- **Object-oriented**: code organized around **objects** that bundle data and the behaviour that works on it; used for large, long-lived systems with many entities, maintained by many people (business logic, GUI frameworks, game entities)
- **Functional**: programs built from **pure functions** (same input → same output, no side effects) and immutable data; used for data pipelines, concurrent code, compilers
- **Generic**: write code once for many types; in C++ (templates) the types are resolved at **compile time**
- **Data-oriented**: lay out data for how it's processed (cache-friendly arrays); used in game engines and high-performance systems
- C++ is **multi-paradigm**; real code mixes these

Same task (sum of prices) in different paradigms:

```cpp
// Procedural: step-by-step, mutate state
int total = 0;
for (int i = 0; i < n; i++) total += prices[i];

// Object-oriented: data + behaviour live together
class Cart {
    vector<int> prices;
public:
    void add(int p) { prices.push_back(p); }
    int total() const { return accumulate(prices.begin(), prices.end(), 0); }
};

// Functional: describe the result, no mutation
int total = accumulate(prices.begin(), prices.end(), 0);

// Generic: one template works for int, double, ...
template <typename T>
T sum(const vector<T>& v) { return accumulate(v.begin(), v.end(), T{}); }
```

- **The 4 pillars of OOP** (each gets its own section below):
  - **Encapsulation**: keep data and the code that guards it together; hide internals
  - **Abstraction**: expose **what** something does, hide **how**
  - **Inheritance**: build a new class from an existing one (is-a)
  - **Polymorphism**: one interface, many behaviours

## 3. Classes & Objects
- **Class**: a blueprint that defines what data a thing has and what it can do; takes no memory by itself
- **Object**: an instance of a class; lives in memory
- **State**: the data stored in an object (its data members)
- **Behaviour**: what the object can do (its member functions)
- **Identity**: what makes one object distinct from another (its address), even if all fields are equal
- **Data members**: variables declared inside a class
- **Member functions**: functions declared inside a class; stored once per class, not per object

```cpp
class Car {                          // blueprint, no memory yet
public:
    string model;                    // state
    int speed = 0;

    void accelerate() { speed += 10; }   // behaviour
};

Car a, b;                            // two objects, separate memory
a.model = "Swift"; a.accelerate();
b.model = "City";
// a.speed == 10, b.speed == 0  → separate state
// &a != &b                     → separate identity
```

- **`this`**: pointer to the current object inside a non-static member function; used to resolve name clashes and to return the object itself (`return *this;`)
  - **Python**: `self` (passed explicitly) · **TS**: `this`

```cpp
class User {
    string name;
public:
    void setName(const string& name) {
        this->name = name;           // member = parameter
    }
};
```

- **Objects on the stack vs heap**:

```cpp
Car c1;                  // stack: destroyed automatically at end of scope
c1.accelerate();         // access with .

Car* c2 = new Car();     // heap: lives until delete
c2->accelerate();        // access with ->
delete c2;
```

- In modern C++ you rarely write `new` yourself; use smart pointers instead (Section 11)
- **Size of an empty class is 1 byte**, not 0, so two distinct objects always have distinct addresses

## 4. Constructors & Destructors
- **Constructor**: special function that runs automatically when an object is created; gives the object a valid starting state; same name as the class, no return type, can be overloaded
- **Destructor**: special function that runs automatically when an object dies; does cleanup (free memory, close files, release locks); written `~ClassName()`, no parameters, no return type, only one per class
- **Default constructor**: can be called with no arguments; the compiler generates one **only if you declare no constructors**
- **Parameterized constructor**: takes arguments to initialize the object
- **Copy constructor**: creates a **new** object from an existing one: `ClassName(const ClassName& other)`
- **Move constructor**: creates a new object by **stealing** the resources of a temporary/expiring one instead of copying: `ClassName(ClassName&& other)`
- **`= default` / `= delete`**: ask the compiler for its version, or forbid a function (e.g. delete copying)

```cpp
class User {
    string name;
    int age;
public:
    User() : name("guest"), age(0) {}                  // default
    User(string n, int a) : name(n), age(a) {}         // parameterized
    User(const User& other) = default;                 // copy (compiler's version)
    ~User() { cout << "bye " << name << "\n"; }        // destructor
};
```

### Initializer lists
- Initialize members **before** the constructor body runs: `User(int x) : id(x) {}`
- Assigning in the body instead means: default-construct the member first, then assign; extra work
- **Required** for:
  - `const` members and reference members (can't be assigned later; without an initializer the code doesn't compile)
  - members or base classes with no default constructor
- Members are initialized in their **declaration order** in the class, not the order you write them in the list

```cpp
class Order {
    const int id;          // must be set in the initializer list
    string& owner;         // references too
public:
    Order(int id, string& owner) : id(id), owner(owner) {}
};
```

### Delegating constructors & `explicit`
- **Delegating constructor**: one constructor calls another so the init logic lives in one place
- **`explicit`**: stops a one-argument constructor from being used for silent implicit conversions; mark single-argument constructors `explicit` by default

```cpp
class Rect {
    int w, h;
public:
    Rect(int w, int h) : w(w), h(h) {}
    explicit Rect(int side) : Rect(side, side) {}    // delegates
};

void draw(Rect r);
draw(5);          // error: explicit stops int → Rect conversion
draw(Rect(5));    // OK, intent is clear
```

### Order of construction & destruction
- Construction: **base → members (in declaration order) → derived constructor body**
- Destruction: the exact **reverse**

```cpp
struct Base    { Base()    { cout << "Base ";    } ~Base()    { cout << "~Base ";    } };
struct Derived : Base {
                 Derived() { cout << "Derived "; } ~Derived() { cout << "~Derived "; } };

{ Derived d; }   // prints: Base Derived ~Derived ~Base
```

### Shallow vs deep copy
- **Shallow copy**: copies member values as they are; for a raw pointer, only the **address** is copied, so two objects point to the same memory
- **Deep copy**: allocates new memory and copies the **contents**, so each object owns its own resource
- The compiler-generated copy is shallow → with raw owned pointers you get a **double free** when both destructors run

```cpp
class Buffer {
    int* data;
    size_t size;
public:
    explicit Buffer(size_t n) : data(new int[n]{}), size(n) {}
    ~Buffer() { delete[] data; }
    // no copy constructor written → compiler copies the pointer (shallow)
};

{
    Buffer a(10);
    Buffer b = a;   // b.data == a.data
}                   // both destructors delete[] the same memory → crash/UB
```

### Copy assignment operator
- **Copy constructor**: makes a **new** object (`Buffer b = a;`)
- **Copy assignment**: overwrites an **existing** object (`b = a;`); must free the old resource, copy the new one, handle self-assignment (`a = a`), and return `*this`

### Rule of 3 / 5 / 0
- **Rule of 3**: if a class needs a custom **destructor**, **copy constructor**, or **copy assignment**, it almost certainly needs all three (it's managing a resource)
- **Rule of 5**: modern C++ adds **move constructor** and **move assignment**; without them, moves fall back to (slow) copies
- **Rule of 0**: best option; don't manage raw resources at all; use `string`, `vector`, `unique_ptr`, which already handle copying/moving/cleanup, and write none of the five

Rule of 5, done properly:

```cpp
class Buffer {
    int* data;
    size_t size;
public:
    explicit Buffer(size_t n) : data(new int[n]{}), size(n) {}
    ~Buffer() { delete[] data; }

    // copy constructor: deep copy
    Buffer(const Buffer& other) : data(new int[other.size]), size(other.size) {
        copy(other.data, other.data + size, data);
    }

    // copy assignment: copy first, then release the old buffer
    Buffer& operator=(const Buffer& other) {
        if (this == &other) return *this;
        int* fresh = new int[other.size];
        copy(other.data, other.data + other.size, fresh);
        delete[] data;
        data = fresh;
        size = other.size;
        return *this;
    }

    // move constructor: steal the pointer, leave other empty
    Buffer(Buffer&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }

    // move assignment
    Buffer& operator=(Buffer&& other) noexcept {
        if (this == &other) return *this;
        delete[] data;
        data = other.data;
        size = other.size;
        other.data = nullptr;
        other.size = 0;
        return *this;
    }
};

Buffer a(10);              // parameterized
Buffer b = a;              // copy constructor
b = a;                     // copy assignment
Buffer c = std::move(a);   // move constructor; a is now empty
```

Rule of 0, which is what you should write day to day:

```cpp
class User {
    string name;           // string and vector clean up after themselves
    vector<int> scores;
public:
    explicit User(string n) : name(std::move(n)) {}
    // no destructor, no copy/move functions needed
};
```

- **Python / TS**: no destructors you can rely on (garbage collected); assignment copies the **reference**, never the object; use `copy.deepcopy()` / `structuredClone()` for deep copies

## 5. Access Modifiers
- **`public`**: accessible from anywhere
- **`private`**: only inside the class (and its friends)
- **`protected`**: inside the class and its derived classes

| Modifier | Inside the class | Derived class | Outside |
|---|---|---|---|
| `public` | Yes | Yes | Yes |
| `protected` | Yes | Yes | No |
| `private` | Yes | No | No |

```cpp
class Animal {
public:
    string name;
protected:
    void breathe() {}
private:
    int age = 5;
};

class Dog : public Animal {
public:
    void test() {
        name = "Bruno";   // OK: public
        breathe();        // OK: protected
        // age = 3;       // error: private to Animal
    }
};

Dog d;
d.name = "Bruno";         // OK
// d.breathe();           // error: protected
```

### Inheritance access modes
- Controls how base members appear **through the derived class**; private base members are never accessible directly
- Default: `class` inherits **privately**, `struct` inherits **publicly**; always write it explicitly
- **Public inheritance** = is-a relationship (what you use 99% of the time)
- **Private inheritance** = "implemented in terms of"; usually composition is the better choice

| Base member | `public` inheritance | `protected` inheritance | `private` inheritance |
|---|---|---|---|
| `public` | public | protected | private |
| `protected` | protected | protected | private |
| `private` | not accessible | not accessible | not accessible |

### Friend functions and classes
- **`friend`**: grants a specific function or class access to private members
- Friendship is **not inherited**, **not mutual**, and **not transitive**
- Common legit use: `operator<<` for printing (Section 10); otherwise use sparingly, since it breaks encapsulation

```cpp
class BankAccount {
    double balance = 5000;
    friend void showBalance(const BankAccount& acc);
    friend class Auditor;
};

void showBalance(const BankAccount& acc) {
    cout << acc.balance;           // allowed: friend function
}

class Auditor {
public:
    void audit(const BankAccount& acc) {
        cout << acc.balance;       // allowed: friend class
    }
};
```

- **Python**: no real access control; `_x` means "private by convention", `__x` triggers name mangling
- **TS**: `private` / `protected` are checked only at compile time (gone in JS output); `#x` is truly private at runtime

## 6. Static & Const Members
- **Static data member**: one copy **shared by all objects** of the class, not one per object
- **Static member function**: belongs to the class, not to an object; has **no `this`**, so it can only touch static members; called as `ClassName::fn()`

```cpp
class User {
    string name;
public:
    inline static int count = 0;     // C++17; older: define int User::count = 0; outside

    explicit User(string n) : name(std::move(n)) { count++; }
    static int total() { return count; }
};

User a("Aayush"), b("Rahul");
cout << User::total();               // 2
```

- Use static for things that really belong to the type (counters, factory functions, constants); a class full of static functions is usually just a namespace
- **`const` member function**: promises not to modify the object; marked with `const` after the parameter list
- **`const` object**: can only call `const` member functions; that's why getters should always be `const`
- **`mutable`**: a member that can change even inside a `const` function; for internal details that don't affect the visible state (caches, counters, mutexes)

```cpp
class Report {
    string text;
    mutable int views = 0;               // bookkeeping, not "real" state
public:
    explicit Report(string t) : text(std::move(t)) {}

    const string& getText() const {      // const: doesn't modify the report
        views++;                         // allowed: views is mutable
        return text;
    }
    void setText(const string& t) { text = t; }
};

const Report r("Q3 numbers");
r.getText();       // OK: const function
// r.setText("x"); // error: non-const function on const object
```

- **Python**: `@staticmethod` (no `self`), `@classmethod` (gets `cls`); class variables are shared · **TS**: `static`; `readonly` for fields

## 7. Encapsulation
- **Encapsulation**: bundle data with the methods that operate on it, and **hide the data** so it can only change through those methods
- **Invariant**: a rule that must always be true for the object (e.g. balance ≥ 0); encapsulation lets the class enforce it in one place
- Make data members `private`; expose **behaviour** (`deposit`, `withdraw`), not raw fields
- **Getters/setters**: don't add them blindly for every field; a public setter with no checks is the same as a public field

```cpp
class BankAccount {
    double balance = 0;                  // hidden; invariant: balance >= 0
public:
    void deposit(double amount) {
        if (amount <= 0) throw invalid_argument("amount must be positive");
        balance += amount;
    }
    void withdraw(double amount) {
        if (amount <= 0 || amount > balance) throw invalid_argument("invalid amount");
        balance -= amount;
    }
    double getBalance() const { return balance; }   // read-only access
};
```

- **Encapsulation vs abstraction** (common interview confusion):

| | Encapsulation | Abstraction |
|---|---|---|
| Focus | **Hiding data** and protecting invariants | **Hiding complexity**; exposing only what's needed |
| Question it answers | Who can touch this data? | What does the user of this need to know? |
| C++ tools | `private`, `protected`, methods | abstract classes, interfaces, clean public APIs |
| Example | `balance` is private, changes only via `deposit()` | `PaymentMethod::pay()`, caller doesn't know if it's UPI or card |

## 8. Abstraction
- **Abstraction**: expose **what** an object does, hide **how** it does it; callers depend on the interface, not the implementation
- **Pure virtual function**: a virtual function with no implementation in the base: `virtual void pay(double) = 0;`
- **Abstract class**: a class with **at least one** pure virtual function; can't be instantiated; can still have data members, constructors, and implemented methods
- **Interface (in C++)**: no keyword; by convention a class with **only** pure virtual functions and a virtual destructor
- Derived classes must override all pure virtual functions, otherwise they're abstract too

```cpp
// Interface: only "what"
class PaymentMethod {
public:
    virtual void pay(double amount) = 0;
    virtual ~PaymentMethod() = default;
};

// Abstract class: shared state + shared behaviour + one hole to fill
class Notification {
protected:
    string recipient;
public:
    explicit Notification(string r) : recipient(std::move(r)) {}
    virtual ~Notification() = default;

    void send(const string& msg) {             // shared logic
        if (recipient.empty()) return;
        deliver(msg);
    }
protected:
    virtual void deliver(const string& msg) = 0;   // each subclass fills this in
};

class UpiPayment : public PaymentMethod {
public:
    void pay(double amount) override { cout << "Paid " << amount << " via UPI\n"; }
};

void checkout(PaymentMethod& method) {         // knows nothing about UPI/cards
    method.pay(499);
}

// PaymentMethod p;   // error: abstract
UpiPayment upi;
checkout(upi);
```

| | Abstract class | Interface |
|---|---|---|
| Methods | mix of pure virtual and implemented | only pure virtual |
| Data members | yes | no |
| Constructor | yes | no (only a virtual destructor) |
| Use when | related classes share code/state | unrelated classes share a capability ("can pay", "can print") |
| Multiple | usually inherit one | a class can implement many |

- **Python**: `from abc import ABC, abstractmethod` · **TS**: `interface` (compile-time only, no code) and `abstract class`

## 9. Inheritance
- **Inheritance**: a derived (child) class gets the members of a base (parent) class and can add or override behaviour; models an **is-a** relationship (a `Dog` is an `Animal`)
- **Types**:
  - **Single**: `B : A`
  - **Multilevel**: `C : B`, `B : A`
  - **Hierarchical**: `B : A`, `C : A`
  - **Multiple**: `C : A, B`
  - **Hybrid**: a mix of the above (e.g. the diamond)

```cpp
class Animal {
protected:
    string name;
public:
    explicit Animal(string n) : name(std::move(n)) {}
    virtual ~Animal() = default;
    virtual void describe() const { cout << name << " is an animal\n"; }
};

class Dog : public Animal {
public:
    explicit Dog(string n) : Animal(std::move(n)) {}   // call the base constructor
    void describe() const override {
        Animal::describe();                         // call the base version
        cout << name << " is also a dog\n";
    }
};
```

- **Method overriding**: a derived class provides its own version of a base `virtual` function (same signature); use `override`
- **Calling the base version**: `Base::fn()` inside the override
- **Not inherited**: constructors (unless you write `using Base::Base;`), destructor, assignment operators, friends
- **Name hiding**: declaring `fn(int)` in the derived class hides **all** base overloads of `fn`; bring them back with `using Base::fn;`
- **Deep hierarchies are a smell**: changes in a base ripple through every child ("fragile base class"); prefer shallow hierarchies and composition (Section 12)

### Diamond problem
- `Printer` and `Scanner` both inherit `Device`; `Copier` inherits both → `Copier` has **two** copies of `Device`, and `copier.id` is ambiguous
- **Virtual inheritance**: `virtual public Device` → only **one** shared `Device` sub-object; the most-derived class constructs it

```
        Device
        /    \
   Printer  Scanner
        \    /
        Copier
```

```cpp
class Device { public: int id = 0; };
class Printer : virtual public Device {};
class Scanner : virtual public Device {};
class Copier  : public Printer, public Scanner {};

Copier c;
c.id = 5;     // OK: one shared Device (without virtual → error: ambiguous)
```

- **Python**: supports multiple inheritance; resolves the diamond with **MRO** (C3 linearization, see `Class.__mro__`) · **TS/JS**: single inheritance only; use interfaces or mixins

## 10. Polymorphism
- **Polymorphism**: one interface, many behaviours; the same call does different things depending on the type
- **Compile-time (static)**: decided by the compiler: function overloading, operator overloading, templates
- **Runtime (dynamic)**: decided while running, based on the real object type: virtual functions

### Function overloading
- Same name, different **parameter list** (count or types); can't overload on return type alone

```cpp
void print(int x)           { cout << "int " << x; }
void print(double x)        { cout << "double " << x; }
void print(const string& s) { cout << "string " << s; }

print(5);         // int
print(5.5);       // double
print("hi"s);     // string
```

### Operator overloading
- Give operators meaning for your types: `+`, `==`, `<<`, `[]`, ...
- `operator<<` must be a **non-member** (left side is `ostream`), usually a friend
- Keep the meaning obvious; `+` should add, not save to a database

```cpp
class Point {
    int x, y;
public:
    Point(int x, int y) : x(x), y(y) {}

    Point operator+(const Point& o) const { return Point(x + o.x, y + o.y); }
    bool operator==(const Point& o) const { return x == o.x && y == o.y; }

    friend ostream& operator<<(ostream& os, const Point& p) {
        return os << "(" << p.x << ", " << p.y << ")";
    }
};

Point a(1, 2), b(3, 4);
cout << a + b;          // (4, 6)
cout << (a == b);       // 0
```

### Templates (brief)
- Compile-time polymorphism: the compiler generates a separate version per type used

```cpp
template <typename T>
T maxOf(T a, T b) { return a > b ? a : b; }

maxOf(3, 7);           // T = int
maxOf(2.5, 1.5);       // T = double
```

### Virtual functions (runtime polymorphism)
- **`virtual`**: calls through a base pointer/reference go to the **actual object's** version, decided at runtime (**dynamic dispatch**)
- Without `virtual`, the call is decided by the **pointer type** at compile time
- **`override`**: tells the compiler you mean to override; typos or signature mismatches become compile errors; always use it
- **`final`**: on a function → can't be overridden further; on a class → can't be inherited

```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double r;
public:
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

class Square final : public Shape {          // nobody can inherit Square
    double s;
public:
    explicit Square(double s) : s(s) {}
    double area() const override { return s * s; }
};

vector<unique_ptr<Shape>> shapes;
shapes.push_back(make_unique<Circle>(1));
shapes.push_back(make_unique<Square>(2));
for (auto& s : shapes) cout << s->area() << "\n";   // each calls its own area()
```

### How it works: vtable and vptr
- **vtable**: one table **per class** with pointers to that class's virtual function implementations
- **vptr**: hidden pointer **in each object** pointing to its class's vtable (set by the constructor)
- `s->area()` → read the object's vptr → find the `area` slot in the vtable → call that function
- Cost: one extra indirection per call, usually no inlining, and +8 bytes per object (on 64-bit)
- Inside a **constructor or destructor**, virtual calls do **not** go to the derived version (the derived part isn't built yet / already destroyed)

```
Circle object                Circle's vtable (one per class)
+-------------+             +---------------------------+
| vptr  ------|-----------> | area  → Circle::area      |
| r = 1.0     |             | ~dtor → Circle::~Circle   |
+-------------+             +---------------------------+
```

### Virtual destructor
- Deleting a derived object through a base pointer, when the base destructor is **not virtual**, is **undefined behaviour**; in practice only the base destructor runs and the derived part leaks
- Rule: **any class meant to be used as a base (has virtual functions) needs a virtual destructor**

```cpp
class Base {
public:
    ~Base() {}                                   // NOT virtual
};
class Derived : public Base {
    int* data = new int[100];
public:
    ~Derived() { delete[] data; }
};

Base* p = new Derived();
delete p;    // UB: ~Derived never runs → data leaks
// fix: virtual ~Base() = default;
```

### Object slicing
- Copying a derived object **by value** into a base object keeps only the base part; the derived data and overrides are "sliced off"
- Fix: work with polymorphic objects through **references or pointers**; often also delete copying in the base

```cpp
class Animal {
public:
    virtual string sound() const { return "..."; }
    virtual ~Animal() = default;
};
class Dog : public Animal {
public:
    string sound() const override { return "Woof"; }
};

Dog d;
Animal a = d;        // sliced: a is just an Animal now
a.sound();           // "..."

Animal& r = d;       // no slicing
r.sound();           // "Woof"
```

### Upcasting & downcasting
- **Upcasting**: derived → base (`Dog*` → `Animal*`); implicit and always safe
- **Downcasting**: base → derived; needs a cast
  - **`dynamic_cast`**: checked at runtime; returns `nullptr` for pointers (throws `bad_cast` for references) if the object isn't that type; base must have a virtual function
  - **`static_cast`**: no check; undefined behaviour if you're wrong
- Lots of `dynamic_cast` in your code usually means a missing virtual function

```cpp
Animal* a = new Dog();                  // upcast: implicit

if (Dog* d = dynamic_cast<Dog*>(a)) {   // safe downcast
    cout << d->sound();
}
Dog* unsafe = static_cast<Dog*>(a);     // compiles; UB if a isn't really a Dog
delete a;
```

- **Python / TS**: every method is effectively virtual; no method overloading (Python: default args; TS: overload *signatures* with one implementation); **duck typing** ("if it has `.pay()`, it's a payment") replaces most interface checks

## 11. Memory & Ownership in OOP
- **Ownership**: who is responsible for destroying an object; in C++ you have to decide this for every heap object
- **RAII (Resource Acquisition Is Initialization)**: tie a resource to an object's lifetime; acquire it in the constructor, release it in the destructor; since destructors always run when a scope ends (even on exceptions), cleanup can't be forgotten
  - Examples in the standard library: `vector`/`string` (memory), `fstream` (files), `lock_guard` (mutexes), smart pointers

```cpp
void bad() {
    int* data = new int[1000];
    process(data);          // if this throws, delete never runs → leak
    delete[] data;
}

void good() {
    vector<int> data(1000); // freed by vector's destructor, even on exceptions
    process(data.data());

    lock_guard<mutex> lock(m);   // unlocked automatically at end of scope
}
```

### Smart pointers
- **`unique_ptr<T>`**: **sole** owner; can't be copied, only moved; deletes the object when it goes out of scope; zero overhead vs a raw pointer; your default choice
- **`shared_ptr<T>`**: **shared** owner; keeps a reference count; the object is deleted when the last `shared_ptr` dies; costs a control block and atomic counter updates
- **`weak_ptr<T>`**: **non-owning** observer of a `shared_ptr` object; doesn't keep it alive; call `.lock()` to get a `shared_ptr` (or empty if it's gone)
- Create with **`make_unique` / `make_shared`**, never with raw `new`

```cpp
auto engine = make_unique<Engine>();
// auto copy = engine;               // error: unique_ptr can't be copied
auto moved = std::move(engine);       // OK: ownership transferred, engine is now null

auto config = make_shared<Config>();
auto alsoConfig = config;             // ref count = 2
```

### Cyclic references
- Two objects holding `shared_ptr`s to each other never reach count 0 → **leak**
- Fix: make the back-pointer a `weak_ptr` (the child observes its parent; it doesn't own it)

```cpp
struct Employee;

struct Team {
    vector<shared_ptr<Employee>> members;   // team owns employees
};

struct Employee {
    weak_ptr<Team> team;                    // shared_ptr here → cycle → leak

    void printTeamSize() {
        if (auto t = team.lock()) cout << t->members.size();
    }
};
```

### Ownership rules for LLD code
- Owns it alone → **value member** or `unique_ptr`
- Truly shared ownership → `shared_ptr` (rarer than people think)
- Observes something that may die first → `weak_ptr`
- Just uses it, doesn't own it, it outlives you → **reference** or raw pointer
- Never call `new`/`delete` directly in application code; that's why modern C++ LLD code looks almost garbage-collected

## 12. Class Relationships
- **IS-A**: inheritance; `Dog` is an `Animal`
- **HAS-A**: one object contains/uses another; `Car` has an `Engine`
- From weakest to strongest:
  - **Dependency**: uses another class **temporarily** (function parameter, local variable); "uses-a"
  - **Association**: a long-lived **link** between two independent objects; neither owns the other (`Doctor` ↔ `Patient`)
  - **Aggregation**: whole-part where the part **can exist without** the whole (`Team` has `Player`s; delete the team, players still exist)
  - **Composition**: whole-part where the part **dies with** the whole (`Car` owns its `Engine`, `House` owns its `Room`s)
- In C++, ownership tells you which one it is:

| Relationship | C++ member | Lifetime |
|---|---|---|
| Composition | value member or `unique_ptr<T>` | part destroyed with the whole |
| Aggregation | `shared_ptr<T>`, or reference/raw pointer to something owned elsewhere | part outlives the whole |
| Association | reference / raw pointer / `weak_ptr<T>` | independent |
| Dependency | function parameter or local | only during the call |

```cpp
class Car {
    Engine engine;                        // composition
};

class Team {
    vector<shared_ptr<Player>> players;   // aggregation: players exist beyond the team
};

class Patient {
    Doctor* doctor = nullptr;             // association: knows about, doesn't own
};

class Report {
public:
    void exportTo(Printer& printer);      // dependency: used only during the call
};
```

### Composition over inheritance
- Inheritance is **fixed at compile time** and couples the child to the parent's internals
- Combining traits through inheritance explodes: `FlyingBird`, `SwimmingBird`, `FlyingSwimmingBird`, ...
- **Composition**: build behaviour out of small objects you hold, and swap them freely, even at runtime
- Use inheritance for real is-a relationships with shared interfaces; use composition to **reuse behaviour**

```cpp
class FlyBehavior {
public:
    virtual void fly() const = 0;
    virtual ~FlyBehavior() = default;
};
class CanFly : public FlyBehavior {
public:
    void fly() const override { cout << "Flying\n"; }
};
class CannotFly : public FlyBehavior {
public:
    void fly() const override { cout << "Can't fly\n"; }
};

class Bird {
    unique_ptr<FlyBehavior> flyBehavior;  // has-a behaviour, not is-a FlyingBird
public:
    explicit Bird(unique_ptr<FlyBehavior> fb) : flyBehavior(std::move(fb)) {}
    void fly() const { flyBehavior->fly(); }
};

Bird sparrow(make_unique<CanFly>());
Bird penguin(make_unique<CannotFly>());
```

### UML class diagrams
- How LLD interviews expect you to sketch classes; a box with three parts: **name**, **attributes**, **methods**
- Visibility: `+` public, `-` private, `#` protected; static is underlined; abstract is in *italics*

```
+--------------------------+
|       BankAccount        |
+--------------------------+
| - balance: double        |
| + owner: string          |
+--------------------------+
| + deposit(amt): void     |
| + getBalance(): double   |
+--------------------------+
```

- Arrows (the arrowhead/diamond sits on the side shown):

```
Inheritance     Dog ─────────▷ Animal           solid line, hollow triangle at parent
Realization     UpiPayment ─ ─ ▷ PaymentMethod  dashed line, hollow triangle at interface
Association     Doctor ──────── Patient         solid line (arrow if one-way)
Aggregation     Team ◇──────── Player           hollow diamond at the whole
Composition     Car ◆──────── Engine            filled diamond at the whole
Dependency      Report ─ ─ ─ ─> Printer         dashed arrow
```

- **Multiplicity**: `1`, `0..1`, `*` (many), `1..*` (at least one); e.g. `Team 1 ◇──── 1..* Player`

## 13. SOLID Principles & Good Design
- Five principles for code that's easy to change; the foundation of LLD interviews
- Each one below: a violating example → the fix

### S: Single Responsibility Principle
- A class should have **one reason to change**

```cpp
// Bad: pricing, formatting, and storage all change for different reasons
class Invoice {
public:
    double total() const;
    void print() const;
    void saveToDb() const;
};

// Good: one job each
class Invoice           { public: double total() const; };
class InvoicePrinter    { public: void print(const Invoice& inv); };
class InvoiceRepository { public: void save(const Invoice& inv); };
```

### O: Open/Closed Principle
- **Open for extension, closed for modification**: add new behaviour by adding code, not by editing working code

```cpp
// Bad: every new discount edits this function
double discount(const string& type, double amount) {
    if (type == "festive") return amount * 0.2;
    if (type == "member")  return amount * 0.1;
    return 0;
}

// Good: a new discount is a new class; existing code is untouched
class Discount {
public:
    virtual double apply(double amount) const = 0;
    virtual ~Discount() = default;
};
class FestiveDiscount : public Discount {
public:
    double apply(double amount) const override { return amount * 0.2; }
};
class MemberDiscount : public Discount {
public:
    double apply(double amount) const override { return amount * 0.1; }
};
```

### L: Liskov Substitution Principle
- A derived class must be usable **anywhere the base is expected** without breaking the caller's assumptions
- Warning signs: overrides that throw "not supported", empty overrides, `dynamic_cast` checks before calling

```cpp
// Bad: a Square "is a" Rectangle mathematically, but not behaviourally
class Rectangle {
protected:
    int w = 0, h = 0;
public:
    virtual void setWidth(int x)  { w = x; }
    virtual void setHeight(int x) { h = x; }
    int area() const { return w * h; }
    virtual ~Rectangle() = default;
};
class Square : public Rectangle {
public:
    void setWidth(int x)  override { w = h = x; }
    void setHeight(int x) override { w = h = x; }
};

void resize(Rectangle& r) {
    r.setWidth(5);
    r.setHeight(4);
    assert(r.area() == 20);    // fails for Square: area is 16
}

// Good: don't force the hierarchy; both are just Shapes
class Shape { public: virtual int area() const = 0; virtual ~Shape() = default; };
// class Rectangle : public Shape { ... };
// class Square    : public Shape { ... };
```

### I: Interface Segregation Principle
- Clients shouldn't be forced to depend on methods they don't use; prefer **small, focused interfaces**

```cpp
// Bad: a basic printer must implement scan() and fax()
class Machine {
public:
    virtual void print() = 0;
    virtual void scan() = 0;
    virtual void fax() = 0;
};

// Good: implement only what you support
class Printer { public: virtual void print() = 0; virtual ~Printer() = default; };
class Scanner { public: virtual void scan()  = 0; virtual ~Scanner() = default; };

class BasicPrinter : public Printer {
public:
    void print() override {}
};
class OfficeMachine : public Printer, public Scanner {
public:
    void print() override {}
    void scan()  override {}
};
```

### D: Dependency Inversion Principle
- High-level code (business logic) shouldn't depend on low-level details (MySQL, SMTP); **both depend on an abstraction**
- **Dependency injection (DI)**: don't create your dependencies inside the class; receive them from outside, usually via the **constructor**
- Payoff: swap implementations freely and test with fakes
- Frameworks like **Nest.js** and **Spring** have a DI container that does this wiring for you

```cpp
// Bad: business logic welded to MySQL; can't test without a real DB
class OrderService {
    MySqlDb db;
public:
    void place(const string& order) { db.save(order); }
};

// Good: depend on an interface, inject the implementation
class Database {
public:
    virtual void save(const string& row) = 0;
    virtual ~Database() = default;
};
class MySqlDb : public Database {
public:
    void save(const string& row) override { /* INSERT ... */ }
};
class InMemoryDb : public Database {
public:
    vector<string> rows;
    void save(const string& row) override { rows.push_back(row); }
};

class OrderService {
    Database& db;
public:
    explicit OrderService(Database& db) : db(db) {}   // constructor injection
    void place(const string& order) { db.save(order); }
};

MySqlDb mysql;    OrderService prod(mysql);
InMemoryDb fake;  OrderService test(fake);           // unit test, no real DB
```

### Coupling & cohesion
- **Coupling**: how much one class depends on others' internals; aim for **low** (changes don't ripple)
- **Cohesion**: how closely related the things inside one class are; aim for **high** (one clear purpose)
- SRP raises cohesion; DIP and interfaces lower coupling

### Other principles
- **DRY (Don't Repeat Yourself)**: every piece of knowledge has one source of truth; but don't merge code that only *looks* similar
- **KISS (Keep It Simple, Stupid)**: the simplest design that works wins
- **YAGNI (You Aren't Gonna Need It)**: don't build for hypothetical future requirements
- **Law of Demeter**: talk only to your direct collaborators; `order.getCustomer().getAddress().getCity()` → `order.shippingCity()`

## 14. Quick Interview Q&A
- **Size of an empty class?** 1 byte, so every object has a unique address
- **`struct` vs `class`?** Only the default access (and default inheritance): public vs private
- **Can a constructor be virtual?** No; the vptr isn't set up until the constructor runs, and to construct something you must know its exact type; the workaround is a virtual `clone()` ("virtual constructor idiom")
- **Can a destructor be virtual?** Yes, and it must be in any polymorphic base class (Section 10)
- **Can a constructor be private?** Yes; used for Singletons and factory functions (`static create()`)
- **Can static functions be virtual?** No; virtual dispatch needs an object (`this`), static functions have none; they also can't be `const`
- **Why does the copy constructor take a reference?** Passing by value would need a copy, which calls the copy constructor again → infinite recursion; `const` so it works with temporaries and doesn't modify the source
- **Copy constructor vs copy assignment?** Constructor creates a new object; assignment overwrites an existing one
- **Can you overload on return type alone?** No; overloads must differ in parameters
- **Overloading vs overriding?** Overloading: same name, different parameters, same scope, compile time; overriding: same signature in a derived class, `virtual`, runtime
- **What is object slicing?** Copying a derived object into a base by value drops the derived part
- **Virtual function called in a constructor?** Calls the current class's version, not the derived one
- **What happens if a derived class doesn't override a pure virtual function?** It's abstract too and can't be instantiated
- **Can an abstract class have a constructor?** Yes; derived classes call it to initialize the shared part
- **Why doesn't Java support multiple inheritance of classes?** To avoid the diamond problem; it allows multiple interfaces instead; C++ allows it and solves the diamond with virtual inheritance
- **Abstract class vs interface?** See the table in Section 8
- **Composition vs aggregation?** Composition: the part dies with the whole; aggregation: the part lives independently

## 15. What to Do Next
Build these in order; together they cover every section of this post.

1. **Implement `Vector<T>`**: a dynamic array with `push_back`, `pop_back`, `size`, `capacity`, and growth by doubling; write the full Rule of 5 (deep copy, move), `operator[]` (const and non-const), and `operator==`; check it with a few tests and AddressSanitizer (`-fsanitize=address`) for leaks
2. **Implement `UniquePtr<T>` and `SharedPtr<T>`**: `UniquePtr` is move-only (delete the copy operations); `SharedPtr` keeps a heap-allocated reference count (copy → +1, destructor → −1, delete at 0); overload `operator*` and `operator->`; stretch: reproduce the cyclic-reference leak, then fix it with a simple `WeakPtr`
3. **Expression evaluator**: an abstract `Expr` with pure virtual `evaluate()` and `print()`; `Number`, `Add`, `Multiply`, `Divide` subclasses holding `unique_ptr<Expr>` children; build and evaluate trees like `(2 + 3) * 4`; covers abstraction, runtime polymorphism, virtual destructors, and composition
4. **Notification system (SOLID refactor)**: start with one `NotificationService` full of `if/else` for Email/SMS/Push; refactor into an `INotifier` interface, one class per channel, injected through the constructor; then add a Slack channel **without editing** existing classes, and write a test using a fake notifier

**Resources**
- [learncpp.com](https://www.learncpp.com/): the best free C++ tutorial; chapters on classes, inheritance, and virtual functions go deeper than this post
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines): the official "how to write modern C++" rules (see the sections on classes, resource management, and ownership)
- [Refactoring Guru](https://refactoring.guru/design-patterns): SOLID and design patterns with diagrams; the natural next step toward LLD
